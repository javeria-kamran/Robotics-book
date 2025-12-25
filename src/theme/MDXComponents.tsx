import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import Callout from '@site/src/components/Callout';
import TLDRBox from '@site/src/components/TLDRBox';

export default {
  // Re-use the default mapping
  ...MDXComponents,
  
  // Custom components
  Callout,
  TLDRBox,
};
