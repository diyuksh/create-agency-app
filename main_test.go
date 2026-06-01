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

	// Dummy tailwind and postcss config
	os.WriteFile(filepath.Join(tmpDir, "tailwind.config.ts"), []byte(""), 0644)
	os.WriteFile(filepath.Join(tmpDir, "postcss.config.js"), []byte(""), 0644)
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
	if _, err := os.Stat(filepath.Join(tmpDir, "tailwind.config.ts")); !os.IsNotExist(err) {
		t.Error("Expected tailwind.config.ts to be removed")
	}
}
