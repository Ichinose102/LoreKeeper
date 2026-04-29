import type { Metadata } from 'next';
import { VaultProvider } from '@/store/vault.store';
import '@/index.css';

export const metadata: Metadata = {
  title: 'LoreKeeper',
  description: 'Outil de gestion de connaissances pour créateurs de contenu Lore & Histoire',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <VaultProvider>
          {children}
        </VaultProvider>
      </body>
    </html>
  );
}
