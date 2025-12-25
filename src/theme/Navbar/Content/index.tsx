import React from 'react';
import NavbarContent from '@theme-original/Navbar/Content';
import type NavbarContentType from '@theme/Navbar/Content';
import type { WrapperProps } from '@docusaurus/types';
import UserMenu from '@site/src/components/UserMenu';

type Props = WrapperProps<typeof NavbarContentType>;

export default function NavbarContentWrapper(props: Props): JSX.Element {
  return (
    <>
      <NavbarContent {...props} />
      <div className="navbar__item navbar__item--right">
        <UserMenu />
      </div>
    </>
  );
}
