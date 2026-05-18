import React from 'react';

export const metadata = {
  title: 'Products | Color Hut Studio',
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
