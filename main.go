package main

import (
	"bufio"
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"

	"github.com/charmbracelet/bubbles/spinner"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/glamour"
	"github.com/charmbracelet/huh"
	"github.com/charmbracelet/lipgloss"
)

//go:embed all:template
var templateFS embed.FS

var (
	subtle    = lipgloss.AdaptiveColor{Light: "#999999", Dark: "#666666"}
	highlight = lipgloss.AdaptiveColor{Light: "#000000", Dark: "#FFFFFF"}
	accent    = lipgloss.AdaptiveColor{Light: "#FF0000", Dark: "#FF0000"}

	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(highlight).
			MarginTop(1).
			MarginBottom(1).
			PaddingLeft(2).
			PaddingRight(2).
			BorderStyle(lipgloss.RoundedBorder()).
			BorderForeground(accent)

	infoStyle = lipgloss.NewStyle().Foreground(subtle)

	paneStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(subtle).
			Padding(1, 2).
			Width(40).
			Height(12)

	activePaneStyle = paneStyle.BorderForeground(accent)
)

func detectPackageManager() string {
	_, err := exec.LookPath("bun")
	if err == nil {
		return "bun"
	}
	if _, err := exec.LookPath("pnpm"); err == nil {
		return "pnpm"
	}
	if _, err := exec.LookPath("yarn"); err == nil {
		return "yarn"
	}
	return "npm"
}

func main() {
	if len(os.Args) > 1 && os.Args[1] == "upgrade" {
		runUpgrade()
		return
	}

	fmt.Println(titleStyle.Render("🚀 Create Agency App"))
	fmt.Println(infoStyle.Render("Scaffold a high-performance Next.js template tailored for your agency."))
	fmt.Println()

	var (
		projectName string
		baseStack   string
		features    []string
	)

	theme := huh.ThemeBase()
	theme.Focused.Base = theme.Focused.Base.Foreground(highlight)
	theme.Focused.Title = theme.Focused.Title.Foreground(highlight).Bold(true)
	theme.Focused.SelectedOption = theme.Focused.SelectedOption.Foreground(accent)
	theme.Focused.FocusedButton = theme.Focused.FocusedButton.Foreground(highlight).Background(accent)

	form := huh.NewForm(
		huh.NewGroup(
			huh.NewInput().
				Title("Project Name").
				Value(&projectName).
				Validate(func(s string) error {
					if strings.TrimSpace(s) == "" {
						return fmt.Errorf("project name cannot be empty")
					}
					return nil
				}),
		),
		huh.NewGroup(
			huh.NewSelect[string]().
				Title("Base Stack").
				Options(huh.NewOption("Next.js (App Router)", "nextjs")).
				Value(&baseStack),
		),
		huh.NewGroup(
			huh.NewMultiSelect[string]().
				Title("Integrations").
				Options(
					huh.NewOption("Tailwind + CVA + Shadcn/ui", "styling").Selected(true),
					huh.NewOption("Sanity CMS", "sanity"),
					huh.NewOption("Shopify Storefront API", "shopify"),
					huh.NewOption("Mailchimp / Klaviyo", "marketing"),
				).
				Value(&features),
		),
	).WithTheme(theme)

	if err := form.Run(); err != nil {
		fmt.Println("CLI cancelled.")
		os.Exit(1)
	}

	pkgManager := detectPackageManager()

	logChan := make(chan string)
	
	// Start background tasks
	go runTasks(projectName, pkgManager, features, logChan)

	p := tea.NewProgram(initialModel(projectName, pkgManager, features, logChan))
	if _, err := p.Run(); err != nil {
		fmt.Println("Error:", err)
		os.Exit(1)
	}

	// Render final markdown success screen
	markdown := fmt.Sprintf(`
# ✨ Scaffolded Successfully

**%s** is ready.

### 📦 Config
* Package Manager: **%s**
* Integrations: **%s**

### 🚀 Next Steps
1. `+"`cd %s`"+`
2. `+"`%s run dev`"+`
`, projectName, pkgManager, strings.Join(features, ", "), projectName, pkgManager)

	r, _ := glamour.NewTermRenderer(glamour.WithAutoStyle(), glamour.WithWordWrap(80))
	out, _ := r.Render(markdown)
	
	fmt.Println(lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(accent).Padding(1, 4).Render(out))
}

func runTasks(projectName, pkgManager string, features []string, logChan chan string) {
	defer close(logChan)

	logChan <- "🌀 Unpacking base template..."
	
	err := fs.WalkDir(templateFS, "template", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		
		relPath, _ := filepath.Rel("template", path)
		if relPath == "." {
			return os.MkdirAll(projectName, 0755)
		}
		
		targetPath := filepath.Join(projectName, relPath)
		
		if d.IsDir() {
			return os.MkdirAll(targetPath, 0755)
		}
		
		data, err := templateFS.ReadFile(path)
		if err != nil {
			return err
		}
		return os.WriteFile(targetPath, data, 0644)
	})
	if err != nil {
		logChan <- "Error unpacking: " + err.Error()
		return
	}

	// Clean up unselected features
	if err := cleanUnselectedFeatures(projectName, features); err != nil {
		logChan <- "Error cleaning up features: " + err.Error()
		return
	}

	logChan <- "📦 Installing dependencies..."
	cmd := exec.Command(pkgManager, "install")
	cmd.Dir = projectName
	streamCmdOutput(cmd, logChan)

	logChan <- "🐙 Initializing Git..."
	cmd = exec.Command("git", "init")
	cmd.Dir = projectName
	streamCmdOutput(cmd, logChan)

	cmd = exec.Command("git", "add", ".")
	cmd.Dir = projectName
	streamCmdOutput(cmd, logChan)

	cmd = exec.Command("git", "commit", "-m", "Initial commit")
	cmd.Dir = projectName
	streamCmdOutput(cmd, logChan)
}

func cleanUnselectedFeatures(projectDir string, features []string) error {
	hasFeature := func(f string) bool {
		for _, feature := range features {
			if feature == f {
				return true
			}
		}
		return false
	}

	pkgPath := filepath.Join(projectDir, "package.json")
	pkgBytes, err := os.ReadFile(pkgPath)
	if err != nil {
		// If there is no package.json, we skip the json manipulation
		return nil
	}
	
	var pkg map[string]interface{}
	json.Unmarshal(pkgBytes, &pkg)

	removeDep := func(dep string) {
		if deps, ok := pkg["dependencies"].(map[string]interface{}); ok {
			delete(deps, dep)
		}
		if devDeps, ok := pkg["devDependencies"].(map[string]interface{}); ok {
			delete(devDeps, dep)
		}
	}
	removeScript := func(script string) {
		if scripts, ok := pkg["scripts"].(map[string]interface{}); ok {
			delete(scripts, script)
		}
	}

	if !hasFeature("marketing") {
		os.RemoveAll(filepath.Join(projectDir, "src/lib/integrations/marketing"))
	}
	if !hasFeature("sanity") {
		os.RemoveAll(filepath.Join(projectDir, "src/lib/integrations/sanity"))
		removeDep("next-sanity")
		removeDep("@sanity/client")
		removeScript("sanity:extract")
	}
	if !hasFeature("shopify") {
		os.RemoveAll(filepath.Join(projectDir, "src/lib/integrations/shopify"))
	}
	if !hasFeature("styling") {
		os.Remove(filepath.Join(projectDir, "tailwind.config.ts"))
		os.Remove(filepath.Join(projectDir, "postcss.config.js"))
		os.WriteFile(filepath.Join(projectDir, "src/app/globals.css"), []byte(""), 0644)
		removeDep("tailwindcss")
		removeDep("postcss")
		removeDep("clsx")
		removeDep("tailwind-merge")
		removeDep("class-variance-authority")
		removeDep("lucide-react")
	}

	outBytes, _ := json.MarshalIndent(pkg, "", "  ")
	return os.WriteFile(pkgPath, outBytes, 0644)
}

func streamCmdOutput(cmd *exec.Cmd, logChan chan string) {
	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	if err := cmd.Start(); err != nil {
		logChan <- "Error: " + err.Error()
		return
	}

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			logChan <- scanner.Text()
		}
	}()

	go func() {
		defer wg.Done()
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			logChan <- scanner.Text()
		}
	}()

	wg.Wait()
	cmd.Wait()
}

// -- Bubble Tea Model --

type logMsg string
type doneMsg struct{}

type model struct {
	spinner spinner.Model
	logs    []string
	logChan chan string
	done    bool
	
	projectName string
	pkgManager  string
	features    []string
}

func initialModel(proj, pkg string, feats []string, lc chan string) model {
	s := spinner.New()
	s.Spinner = spinner.MiniDot
	s.Style = lipgloss.NewStyle().Foreground(accent)
	return model{
		spinner:     s,
		logs:        []string{},
		logChan:     lc,
		projectName: proj,
		pkgManager:  pkg,
		features:    feats,
	}
}

func (m model) Init() tea.Cmd {
	return tea.Batch(m.spinner.Tick, waitForLog(m.logChan))
}

func waitForLog(c chan string) tea.Cmd {
	return func() tea.Msg {
		msg, ok := <-c
		if !ok {
			return doneMsg{}
		}
		return logMsg(msg)
	}
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		if msg.String() == "ctrl+c" || msg.String() == "q" {
			return m, tea.Quit
		}
	case spinner.TickMsg:
		var cmd tea.Cmd
		m.spinner, cmd = m.spinner.Update(msg)
		return m, cmd
	case logMsg:
		m.logs = append(m.logs, string(msg))
		if len(m.logs) > 10 {
			m.logs = m.logs[len(m.logs)-10:] // keep last 10 lines
		}
		return m, waitForLog(m.logChan)
	case doneMsg:
		m.done = true
		return m, tea.Quit
	}
	return m, nil
}

func (m model) View() string {
	if m.done {
		return ""
	}

	leftContent := fmt.Sprintf("%s Scaffolding %s\n\n", m.spinner.View(), m.projectName)
	leftContent += fmt.Sprintf("Stack: Next.js\nPackage Manager: %s\nIntegrations: %d selected\n\n", m.pkgManager, len(m.features))
	leftContent += lipgloss.NewStyle().Foreground(subtle).Render("Working...")

	leftPane := activePaneStyle.Render(leftContent)

	rightContent := strings.Join(m.logs, "\n")
	if rightContent == "" {
		rightContent = "Waiting for logs..."
	}
	
	rightPane := paneStyle.Render(rightContent)

	return lipgloss.JoinHorizontal(lipgloss.Top, leftPane, rightPane) + "\n"
}
