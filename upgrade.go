package main

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

// runUpgrade safely updates core template infrastructure files 
// without overwriting user-modified application code.
func runUpgrade() {
	fmt.Println(titleStyle.Render("🔄 Upgrading Agency App Template"))
	
	// Ensure we are inside a valid project
	if _, err := os.Stat("package.json"); os.IsNotExist(err) {
		fmt.Println(accent.Dark, "Error: package.json not found. Run this command in the root of your project.")
		os.Exit(1)
	}

	fmt.Println(infoStyle.Render("Upgrading core scripts (src/lib/scripts & src/lib/styles/scripts)..."))

	// Define which directories are safe to simply overwrite
	// These should be pure infrastructure scripts that users don't typically modify
	safeDirs := []string{
		"src/lib/scripts",
		"src/lib/styles/scripts",
	}

	err := fs.WalkDir(templateFS, "template", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		relPath, _ := filepath.Rel("template", path)
		
		// Check if the current file is inside one of the safe directories
		isSafe := false
		for _, dir := range safeDirs {
			if strings.HasPrefix(relPath, dir) {
				isSafe = true
				break
			}
		}

		if !isSafe {
			return nil // Skip this file
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
	fmt.Println(infoStyle.Render("Your core CLI and dev scripts are now up to date."))
}
