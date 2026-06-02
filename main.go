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
		jiraKey     string
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
			huh.NewInput().
				Title("Jira Project Key (e.g. AGEN)").
				Value(&jiraKey),
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
					huh.NewOption("AI Agents Orchestration", "ai_orchestration"),
					huh.NewOption("Vercel Analytics", "analytics"),
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
	go runTasks(projectName, pkgManager, features, jiraKey, logChan)

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

	var startDev bool
	huh.NewConfirm().
		Title("Should I spin up the dev server right now?").
		Value(&startDev).
		Run()

	if startDev {
		fmt.Println("🚀 Starting dev server...")
		cmd := exec.Command(pkgManager, "run", "dev")
		cmd.Dir = projectName
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		cmd.Run()
	}
}

func runTasks(projectName, pkgManager string, features []string, jiraKey string, logChan chan string) {
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

	// Create config file
	logChan <- "📝 Creating agency app config..."
	config := map[string]interface{}{
		"version": "1.1.1",
		"stack": pkgManager,
		"features": features,
	}
	configBytes, _ := json.MarshalIndent(config, "", "  ")
	os.WriteFile(filepath.Join(projectName, ".agency-app-config.json"), configBytes, 0644)

	// Create .env.local.example
	logChan <- "📝 Creating environment variables template..."
	envExample := ""
	hasFeature := func(f string) bool {
		for _, feature := range features {
			if feature == f {
				return true
			}
		}
		return false
	}
	if hasFeature("sanity") {
		envExample += "NEXT_PUBLIC_SANITY_PROJECT_ID=\nNEXT_PUBLIC_SANITY_DATASET=\n"
	}
	if hasFeature("shopify") {
		envExample += "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=\nNEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=\n"
	}
	if envExample != "" {
		os.WriteFile(filepath.Join(projectName, ".env.local.example"), []byte(envExample), 0644)
	}

	logChan <- "📝 Generating dynamic README..."
	readmeContent := fmt.Sprintf("# %s\n\nGenerated with create-agency-app.\n\n", projectName)
	if hasFeature("sanity") {
		readmeContent += "## Sanity CMS\nRemember to add `NEXT_PUBLIC_SANITY_PROJECT_ID` in your `.env.local`.\n\n"
	}
	if hasFeature("shopify") {
		readmeContent += "## Shopify\nRemember to add `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` in your `.env.local`.\n\n"
	}
	readmeContent += "## Setup\nRun `npm install` and `npm run dev`.\n"
	os.WriteFile(filepath.Join(projectName, "README.md"), []byte(readmeContent), 0644)

	logChan <- "📦 Installing dependencies..."
	cmd := exec.Command(pkgManager, "install")
	cmd.Dir = projectName
	streamCmdOutput(cmd, logChan)

	logChan <- "🐙 Initializing Git..."
	cmd = exec.Command("git", "init")
	cmd.Dir = projectName
	streamCmdOutput(cmd, logChan)

	if jiraKey != "" {
		logChan <- "🪝 Setting up Git Hooks..."
		hookPath := filepath.Join(projectName, ".git", "hooks", "commit-msg")
		hookContent := fmt.Sprintf("#!/bin/sh\n# Enforce <gitmoji> %s-ID: message pattern\nif ! grep -qE \"^.* %s-[0-9]+: \" \"$1\"; then\n\techo \"Aborting commit. Your commit message must contain %s-ID.\"\n\texit 1\nfi\n", jiraKey, jiraKey, jiraKey)
		os.WriteFile(hookPath, []byte(hookContent), 0755)
	}

	cmd = exec.Command("git", "add", ".")
	cmd.Dir = projectName
	streamCmdOutput(cmd, logChan)

	commitMsg := "🎉 INIT: Scaffold new agency application"
	if jiraKey != "" {
		commitMsg = fmt.Sprintf("🎉 INIT: Scaffold new agency application %s-1", jiraKey)
	}
	cmd = exec.Command("git", "commit", "-m", commitMsg)
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
	if !hasFeature("analytics") {
		removeDep("@vercel/analytics")
	}
	if !hasFeature("ai_orchestration") {
		os.RemoveAll(filepath.Join(projectDir, ".gemini"))
		os.RemoveAll(filepath.Join(projectDir, "project-specs"))
		os.RemoveAll(filepath.Join(projectDir, "project-tasks"))
		os.RemoveAll(filepath.Join(projectDir, "project-docs"))
		removeScript("orchestrate")
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
