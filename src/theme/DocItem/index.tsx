import React from 'react';
import DocItem from '@theme-original/DocItem';
import type DocItemType from '@theme/DocItem';
import type { WrapperProps } from '@docusaurus/types';
import DocPageActions from '@site/src/components/DocPageActions';

type Props = WrapperProps<typeof DocItemType>;

export default function DocItemWrapper(props: Props): JSX.Element {
  // Get the page path for saving edits
  const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
  
  // Get content from the doc (simplified - we'll grab the text from the DOM)
  const [content, setContent] = React.useState('');
  
  React.useEffect(() => {
    // Wait for content to render, then grab the markdown content
    const timer = setTimeout(() => {
      const article = document.querySelector('article');
      if (article) {
        setContent(article.textContent || '');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [pagePath]);

  return (
    <>
      <DocPageActions content={content} pagePath={pagePath} />
      <DocItem {...props} />
    </>
  );
}
