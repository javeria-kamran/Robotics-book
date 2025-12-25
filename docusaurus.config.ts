import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Physical AI & Humanoid Robotics',
  tagline: 'Build robots that actually work. Dark humor included, sanity not guaranteed.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Production URL - update for your deployment
  url: 'https://how-to-make-humanoid-robot.vercel.app',
  baseUrl: '/',

  // GitHub Pages deployment config (not needed for Vercel)
  // organizationName: 'physical-ai',
  // projectName: 'Physical-AI-Humanoid-Robotics-Course-Book',
  trailingSlash: false,
  // deploymentBranch: 'gh-pages',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // SEO and metadata
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content: 'robotics, ROS 2, humanoid robots, NVIDIA Isaac, simulation, Gazebo, VLA, AI, machine learning, physical AI',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'author',
        content: 'Physical AI Team',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:type',
        content: 'website',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'anonymous',
      },
    },
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ur'],
    localeConfigs: {
      en: {
        label: 'English',
        direction: 'ltr',
      },
      ur: {
        label: 'Urdu',
        direction: 'rtl',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/physical-ai/humanoid-robotics-book/edit/main/',
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    metadata: [
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:site', content: '@physicalai'},
      {name: 'twitter:creator', content: '@physicalai'},
      {property: 'og:image:width', content: '1200'},
      {property: 'og:image:height', content: '630'},
    ],
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'Physical AI Logo',
        src: 'img/logo-light.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'bookSidebar',
          position: 'left',
          label: 'The Book',
        },
        {
          to: '/chatbot',
          label: 'AI Assistant',
          position: 'left',
          className: 'header-chat-link',
        },
        {
          href: 'https://github.com/physical-ai/humanoid-robotics-book',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {
              label: 'Start Reading',
              to: '/docs',
            },
            {
              label: 'Module 1: ROS 2',
              to: '/docs/module-1-ros2',
            },
            {
              label: 'Module 2: Simulation',
              to: '/docs/module-2-simulation',
            },
            {
              label: 'Module 3: NVIDIA Isaac',
              to: '/docs/module-3-isaac',
            },
            {
              label: 'Module 4: VLA',
              to: '/docs/module-4-vla',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/physical-ai',
            },
            {
              label: 'Twitter / X',
              href: 'https://x.com/physicalai',
            },
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/physical-ai/humanoid-robotics-book/discussions',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'AI Assistant',
              to: '/chatbot',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/physical-ai/humanoid-robotics-book',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Physical AI. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'bash', 'yaml', 'json', 'cpp'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
