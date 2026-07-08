/**
 * Integration Bundles Configuration
 *
 * Defines which dependencies, folders, and files belong to each integration.
 * Used by the setup script to selectively remove unused integrations.
 */

export interface BarrelExport {
  /** Path to the barrel export file (e.g., 'components/ui/index.ts') */
  file: string
  /** Pattern to match export lines to remove (e.g., 'sanity-image') */
  pattern: string
}

import type { SourceFile } from 'ts-morph'
import { Node, JsxElement, JsxSelfClosingElement } from 'ts-morph'

export interface CodeTransform {
  /** Path to the file to transform */
  file: string
  /** AST transformation function using ts-morph */
  transform: (sourceFile: SourceFile) => void
}

export interface IntegrationBundle {
  name: string
  description: string
  /** Dependencies to remove from package.json */
  dependencies: string[]
  /** Dev dependencies to remove from package.json */
  devDependencies: string[]
  /** Folders to remove */
  folders: string[]
  /** Individual files to remove */
  files: string[]
  /** Patterns to check in next.config.ts (for manual cleanup hints) */
  configPatterns: string[]
  /** Environment variables this integration uses */
  envVars: string[]
  /** Barrel exports to update when this integration is removed */
  barrelExports: BarrelExport[]
  /** Code transformations to apply when this integration is removed */
  codeTransforms: CodeTransform[]
}

export const INTEGRATION_BUNDLES: Record<string, IntegrationBundle> = {
  sanity: {
    name: 'Sanity CMS',
    description: 'Headless CMS with visual editing and real-time collaboration',
    dependencies: [
      '@portabletext/react',
      '@sanity/asset-utils',
      '@sanity/image-url',
      '@sanity/visual-editing',
      'next-sanity',
    ],
    devDependencies: ['@sanity/vision', 'sanity'],
    folders: [
      'src/lib/integrations/sanity',
      'app/studio',
      'app/(examples)/sanity',
      'components/ui/sanity-image',
    ],
    files: [],
    configPatterns: ['cdn.sanity.io', '@sanity'],
    envVars: [
      'NEXT_PUBLIC_SANITY_PROJECT_ID',
      'NEXT_PUBLIC_SANITY_DATASET',
      'NEXT_PUBLIC_SANITY_API_READ_TOKEN',
      'SANITY_API_READ_TOKEN',
      'SANITY_PRIVATE_TOKEN',
      'SANITY_API_WRITE_TOKEN',
      'SANITY_STUDIO_PROJECT_ID',
      'SANITY_REVALIDATE_SECRET',
    ],
    barrelExports: [
      { file: 'components/ui/index.ts', pattern: 'sanity-image' },
    ],
    codeTransforms: [],
  },
  basehub: {
    name: 'BaseHub CMS',
    description: 'AI-native CMS for Next.js',
    dependencies: ['basehub'],
    devDependencies: [],
    folders: ['src/lib/integrations/basehub'],
    files: [],
    configPatterns: [],
    envVars: ['BASEHUB_TOKEN'],
    barrelExports: [],
    codeTransforms: [
      {
        file: 'package.json',
        transform: (sourceFile) => {
          // Note: package.json is usually handled by updatePackageJson, 
          // but we also have "basehub dev &" in scripts.dev which setup-project.ts 
          // doesn't automatically parse for script content yet.
          // A full robust fix would involve reading package.json as text, 
          // but since ts-morph doesn't do JSON well, we will leave it for now.
        }
      }
    ],
  },

  shopify: {
    name: 'Shopify',
    description: 'E-commerce platform integration with cart and checkout',
    dependencies: [],
    devDependencies: [],
    folders: ['src/lib/integrations/shopify', 'app/(examples)/shopify'],
    files: [],
    configPatterns: ['cdn.shopify.com'],
    envVars: [
      'SHOPIFY_STORE_DOMAIN',
      'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
      'SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID',
      'SHOPIFY_CUSTOMER_ACCOUNT_API_URL',
    ],
    barrelExports: [],
    codeTransforms: [],
  },

  hubspot: {
    name: 'HubSpot',
    description: 'Marketing forms and newsletter integration',
    dependencies: [],
    devDependencies: [],
    folders: ['src/lib/integrations/hubspot', 'app/(examples)/hubspot'],
    files: [],
    configPatterns: [],
    envVars: ['HUBSPOT_ACCESS_TOKEN', 'NEXT_PUBLIC_HUBSPOT_PORTAL_ID'],
    barrelExports: [],
    codeTransforms: [],
  },

  mailchimp: {
    name: 'Mailchimp',
    description: 'Email marketing and newsletter subscriptions',
    dependencies: [],
    devDependencies: [],
    folders: ['src/lib/integrations/mailchimp'],
    files: [],
    configPatterns: [],
    envVars: [
      'MAILCHIMP_API_KEY',
      'MAILCHIMP_SERVER_PREFIX',
      'MAILCHIMP_AUDIENCE_ID',
    ],
    barrelExports: [],
    codeTransforms: [],
  },

  webgl: {
    name: 'WebGL / 3D',
    description: 'Three.js and React Three Fiber for 3D graphics',
    dependencies: [
      '@react-three/drei',
      '@react-three/fiber',
      'postprocessing',
      'three',
      'tunnel-rat',
    ],
    devDependencies: ['@types/three'],
    folders: [
      'src/lib/webgl',
      'app/(examples)/r3f',
      'components/effects/animated-gradient',
    ],
    files: [],
    configPatterns: ['@react-three', 'three', 'postprocessing'],
    envVars: [],
    barrelExports: [
      { file: 'components/effects/index.ts', pattern: 'animated-gradient' },
    ],
    codeTransforms: [
      {
        file: 'src/lib/features/index.tsx',
        transform: (sourceFile) => {
          sourceFile.getVariableStatement('LazyGlobalCanvas')?.remove();
          sourceFile.getDescendants().forEach(node => {
            if (Node.isJsxSelfClosingElement(node)) {
              if (node.getText().includes('LazyGlobalCanvas')) {
                node.replaceWithText('');
              }
            }
          });
        }
      },
      {
        file: 'src/lib/dev/cmdo.tsx',
        transform: (sourceFile) => {
          sourceFile.getDescendants().forEach(node => {
            if (Node.isJsxElement(node) && node.getText().includes('id="webgl"')) {
              node.replaceWithText('');
            }
          });
        }
      },
      {
        file: 'components/layout/wrapper/index.tsx',
        transform: (sourceFile) => {
          sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === '@/webgl/components/canvas')?.remove();
          const wrapperProps = sourceFile.getInterface('WrapperProps');
          wrapperProps?.getProperty('webgl')?.remove();
        }
      },
    ],
  },

  theatre: {
    name: 'Theatre.js',
    description: 'Animation debugging and timeline editor',
    dependencies: [],
    devDependencies: ['@theatre/core', '@theatre/studio'],
    folders: ['src/lib/dev/theatre', 'public/config'],
    files: [],
    configPatterns: [],
    envVars: [],
    barrelExports: [],
    codeTransforms: [
      {
        file: 'src/lib/dev/index.tsx',
        transform: (sourceFile) => {
          sourceFile.getVariableStatement('Studio')?.remove();
          sourceFile.getDescendants().forEach(node => {
            if (Node.isJsxElement(node) && node.getText().includes('<Studio />')) {
              node.replaceWithText('');
            }
          });
        }
      },
      {
        file: 'src/lib/dev/cmdo.tsx',
        transform: (sourceFile) => {
          sourceFile.getDescendants().forEach(node => {
            if (Node.isJsxElement(node) && node.getText().includes('id="studio"')) {
              node.replaceWithText('');
            }
          });
        }
      },
    ],
  },
  posthog: {
    name: 'PostHog Analytics',
    description: 'Product analytics and session recording',
    dependencies: ['posthog-js'],
    devDependencies: [],
    folders: [],
    files: ['src/providers/posthog-provider.tsx'],
    configPatterns: [],
    envVars: ['NEXT_PUBLIC_POSTHOG_KEY', 'NEXT_PUBLIC_POSTHOG_HOST'],
    barrelExports: [],
    codeTransforms: [
      {
        file: 'src/app/layout.tsx',
        transform: (sourceFile) => {
          sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === '@/providers/posthog-provider')?.remove();
          sourceFile.getDescendants().forEach(node => {
            if (Node.isJsxElement(node) && node.getOpeningElement().getTagNameNode().getText() === 'PostHogProvider') {
              const children = node.getJsxChildren();
              node.replaceWithText(children.map(c => c.getText()).join(''));
            }
          });
        }
      }
    ],
  },
  'shopify-analytics': {
    name: 'Shopify Native Analytics',
    description: 'Shopify customer privacy API and native analytics tracking',
    dependencies: ['@shopify/hydrogen-react'],
    devDependencies: [],
    folders: [],
    files: ['src/providers/shopify-analytics.tsx'],
    configPatterns: [],
    envVars: [],
    barrelExports: [],
    codeTransforms: [
      {
        file: 'src/app/layout.tsx',
        transform: (sourceFile) => {
          sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === '@/providers/shopify-analytics')?.remove();
          sourceFile.getDescendants().forEach(node => {
            if (Node.isJsxSelfClosingElement(node) && node.getTagNameNode().getText() === 'ShopifyAnalytics') {
              node.remove();
            }
          });
        }
      }
    ],
  },
  sentry: {
    name: 'Sentry Error Tracking',
    description: 'Error tracking and performance monitoring',
    dependencies: ['@sentry/nextjs'],
    devDependencies: [],
    folders: [],
    files: [
      'sentry.client.config.ts',
      'sentry.server.config.ts',
      'sentry.edge.config.ts',
    ],
    configPatterns: [],
    envVars: ['NEXT_PUBLIC_SENTRY_DSN'],
    barrelExports: [],
    codeTransforms: [
      {
        file: 'next.config.ts',
        transform: (sourceFile) => {
          sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === '@sentry/nextjs')?.remove();
          const exportAssign = sourceFile.getExportAssignment(exp => exp.getText().includes('withSentryConfig'));
          if (exportAssign) {
            exportAssign.replaceWithText('export default nextConfig;');
          }
        }
      }
    ],
  },
}

/**
 * Get all integration names
 */
export const getIntegrationNames = () => Object.keys(INTEGRATION_BUNDLES)
