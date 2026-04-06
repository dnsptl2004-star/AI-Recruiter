import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'AI Interview Scheduler',
  description: 'AI-powered interview scheduler',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                  Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
                  'Liberation Sans', sans-serif;
              }
            `,
          }}
        />
      </head>
      <body>
        <Toaster richColors position="top-right" />

        {children}
      </body>
    </html>
  );
}
