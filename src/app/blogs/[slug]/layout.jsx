export async function generateMetadata({ params }) {
  // In a real app, you would fetch the blog data here
  // For now, we'll return a generic metadata
  return {
    title: `Blog Post | Globium Clouds`,
    description: 'Read this article from Globium Clouds',
    openGraph: {
      title: `Blog Post | Globium Clouds`,
      description: 'Read this article from Globium Clouds',
      type: 'article',
    },
  };
}

export default function BlogDetailLayout({ children }) {
  return children;
}
