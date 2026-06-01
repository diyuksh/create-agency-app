package main

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

func mergePackageJSON() error {
	localData, err := os.ReadFile("package.json")
	if err != nil {
		return err
	}

	tmplData, err := templateFS.ReadFile("template/package.json")
	if err != nil {
		return err
	}

	var localPkg, tmplPkg map[string]interface{}
	if err := json.Unmarshal(localData, &localPkg); err != nil {
		return err
	}
	if err := json.Unmarshal(tmplData, &tmplPkg); err != nil {
		return err
	}

	updateDeps := func(key string) {
		if tmplDeps, ok := tmplPkg[key].(map[string]interface{}); ok {
			localDeps, ok := localPkg[key].(map[string]interface{})
			if !ok {
				localDeps = make(map[string]interface{})
				localPkg[key] = localDeps
			}
			for k, v := range tmplDeps {
				localDeps[k] = v
			}
		}
	}

	updateDeps("dependencies")
	updateDeps("devDependencies")

	if tmplScripts, ok := tmplPkg["scripts"].(map[string]interface{}); ok {
		localScripts, ok := localPkg["scripts"].(map[string]interface{})
		if !ok {
			localScripts = make(map[string]interface{})
			localPkg["scripts"] = localScripts
		}
		coreScripts := []string{"dev", "dev:https", "build", "preview", "check", "clean", "lint", "format", "typecheck", "analyze", "dev:inspect", "doctor", "setup:project", "test:setup", "setup:styles", "generate", "handoff", "sanity:mcp", "test:e2e"}
		for _, k := range coreScripts {
			if v, ok := tmplScripts[k]; ok {
				localScripts[k] = v
			}
		}
	}

	mergedData, err := json.MarshalIndent(localPkg, "", "\t")
	if err != nil {
		return err
	}
	
	fmt.Println("✅ Updated: package.json (Merged dependencies and core scripts)")
	return os.WriteFile("package.json", mergedData, 0644)
}

// runUpgrade safely updates core template infrastructure files 
// without overwriting user-modified application code.
func runUpgrade() {
	fmt.Println(titleStyle.Render("🔄 Upgrading Agency App Template"))
	
	if _, err := os.Stat("package.json"); os.IsNotExist(err) {
		fmt.Println(accent.Dark, "Error: package.json not found. Run this command in the root of your project.")
		os.Exit(1)
	}

	fmt.Println(infoStyle.Render("Upgrading core scripts and dependencies..."))

	if err := mergePackageJSON(); err != nil {
		fmt.Println("❌ Failed to merge package.json:", err)
	}

	safeDirs := []string{
		"src/lib/scripts",
		"src/lib/styles/scripts",
		"playwright",
		"playwright.config.ts",
	}

	err := fs.WalkDir(templateFS, "template", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		relPath, _ := filepath.Rel("template", path)
		
		isSafe := false
		for _, dir := range safeDirs {
			if strings.HasPrefix(relPath, dir) {
				isSafe = true
				break
			}
		}

		if !isSafe {
			return nil
		}

		if d.IsDir() {
			return os.MkdirAll(relPath, 0755)
		}

		data, err := templateFS.ReadFile(path)
		if err != nil {
			return err
		}
		
		fmt.Printf("✅ Updated: %s\n", relPath)
		return os.WriteFile(relPath, data, 0644)
	})

	if err != nil {
		fmt.Println("❌ Upgrade failed:", err)
		os.Exit(1)
	}

	fmt.Println(titleStyle.Render("✨ Upgrade complete!"))
	fmt.Println(infoStyle.Render("Your core CLI, dependencies, and dev scripts are now up to date."))
	fmt.Println(infoStyle.Render("Run your package manager install command (e.g., 'bun install' or 'npm install') to apply dependency updates."))
}
