export default function (plop) {
  plop.setGenerator('component', {
    description: 'Create a new React component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What should the component be called?',
        validate: (value) => {
          if (!value) return 'Component name is required'
          return true
        },
      },
      {
        type: 'confirm',
        name: 'client',
        message: 'Should this be a client component (\'use client\')?',
        default: false,
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/{{pascalCase name}}.tsx',
        templateFile: 'templates/component/component.tsx.hbs',
      },
      {
        type: 'append',
        path: 'src/components/index.ts',
        template: 'export { {{pascalCase name}} } from \'./{{pascalCase name}}\'',
      }
    ]
  })

  plop.setGenerator('page', {
    description: 'Create a new Next.js page',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What should the page be called? (e.g., about, contact)',
        validate: (value) => {
          if (!value) return 'Page name is required'
          return true
        },
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'src/app/{{dashCase name}}/page.tsx',
        templateFile: 'templates/page/page.tsx.hbs',
      }
    ]
  })
}
