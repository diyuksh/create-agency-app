package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestCleanUnselectedFeatures(t *testing.T) {
	// Create a temporary directory to act as the project structure
	tmpDir := t.TempDir()

	// Setup dummy package.json
	pkg := map[string]interface{}{
		"dependencies": map[string]interface{}{
			"@sanity/client": "1.0.0",
			"next-sanity":    "1.0.0",
			"tailwindcss":    "1.0.0",
			"clsx":           "1.0.0",
			"lucide-react":   "1.0.0",
		},
		"devDependencies": map[string]interface{}{
			"postcss": "1.0.0",
		},
		"scripts": map[string]interface{}{
			"sanity:extract": "something",
			"dev":            "bun run dev",
		},
	}
	
	pkgBytes, _ := json.Marshal(pkg)
	os.WriteFile(filepath.Join(tmpDir, "package.json"), pkgBytes, 0644)

	// Create dummy integration folders
	integrationsDir := filepath.Join(tmpDir, "src", "lib", "integrations")
	os.MkdirAll(filepath.Join(integrationsDir, "sanity"), 0755)
	os.MkdirAll(filepath.Join(integrationsDir, "marketing"), 0755)
	os.MkdirAll(filepath.Join(integrationsDir, "shopify"), 0755)

	// Dummy postcss config for Tailwind v4
	os.WriteFile(filepath.Join(tmpDir, "postcss.config.mjs"), []byte(""), 0644)
	os.MkdirAll(filepath.Join(tmpDir, "src", "app"), 0755)
	os.WriteFile(filepath.Join(tmpDir, "src", "app", "globals.css"), []byte("has tailwind"), 0644)

	// Run function with ALL features missing
	features := []string{}
	err := cleanUnselectedFeatures(tmpDir, features)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	// Verify package.json is stripped
	updatedPkgBytes, _ := os.ReadFile(filepath.Join(tmpDir, "package.json"))
	var updatedPkg map[string]interface{}
	json.Unmarshal(updatedPkgBytes, &updatedPkg)

	deps := updatedPkg["dependencies"].(map[string]interface{})
	if _, ok := deps["tailwindcss"]; ok {
		t.Error("Expected tailwindcss to be removed")
	}
	if _, ok := deps["@sanity/client"]; ok {
		t.Error("Expected @sanity/client to be removed")
	}

	scripts := updatedPkg["scripts"].(map[string]interface{})
	if _, ok := scripts["sanity:extract"]; ok {
		t.Error("Expected sanity:extract to be removed")
	}

	// Verify directories are gone
	if _, err := os.Stat(filepath.Join(integrationsDir, "sanity")); !os.IsNotExist(err) {
		t.Error("Expected sanity folder to be removed")
	}
	if _, err := os.Stat(filepath.Join(integrationsDir, "marketing")); !os.IsNotExist(err) {
		t.Error("Expected marketing folder to be removed")
	}
	if _, err := os.Stat(filepath.Join(integrationsDir, "shopify")); !os.IsNotExist(err) {
		t.Error("Expected shopify folder to be removed")
	}
	if _, err := os.Stat(filepath.Join(tmpDir, "postcss.config.mjs")); !os.IsNotExist(err) {
		t.Error("Expected postcss.config.mjs to be removed")
	}
}

func TestModelUpdate(t *testing.T) {
	lc := make(chan string, 5)
	m := initialModel("my-project", "bun", []string{"Lenis"}, lc)

	// Test initial state
	if len(m.logs) != 0 {
		t.Errorf("Expected 0 logs, got %d", len(m.logs))
	}

	// Simulate receiving a log message
	newModel, _ := m.Update(logMsg("Installing dependencies..."))
	m = newModel.(model)
	if len(m.logs) != 1 || m.logs[0] != "Installing dependencies..." {
		t.Errorf("Expected log to be added, got %v", m.logs)
	}

	// Simulate receiving a done message
	newModel, cmd := m.Update(doneMsg{})
	m = newModel.(model)
	if !m.done {
		t.Error("Expected done to be true")
	}
	if cmd == nil {
		t.Error("Expected Quit command to be returned")
	}
}

func TestDetectPackageManager(t *testing.T) {
	// This tests that the function successfully returns a string
	// It relies on the environment, so we just verify it doesn't panic
	// and returns one of the expected package managers.
	pkgManager := detectPackageManager()
	if pkgManager != "bun" && pkgManager != "pnpm" && pkgManager != "npm" {
		t.Errorf("Expected bun, pnpm, or npm, got %s", pkgManager)
	}
}
