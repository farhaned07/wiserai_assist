"use client"

import React from 'react';

interface SimpleMarkdownRendererProps {
  content: string;
  className?: string;
}

// A very basic markdown renderer that doesn't rely on external dependencies
export default function SimpleMarkdownRenderer({ content, className }: SimpleMarkdownRendererProps) {
  // Function to convert markdown to HTML (very basic implementation)
  const convertMarkdownToHtml = (markdown: string) => {
    // Replace headers
    let html = markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Replace bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/__(.*?)__/gim, '<strong>$1</strong>')
      .replace(/_(.*?)_/gim, '<em>$1</em>');

    // Replace links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>');

    // Replace lists
    html = html.replace(/^\s*\n\* (.*)/gim, '<ul>\n<li>$1</li>\n</ul>');
    html = html.replace(/^\s*\n\d\. (.*)/gim, '<ol>\n<li>$1</li>\n</ol>');
    
    // Replace multiple <ul> or <ol> tags with just one
    html = html
      .replace(/<\/ul>\s*<ul>/gim, '')
      .replace(/<\/ol>\s*<ol>/gim, '');

    // Replace code blocks
    html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
    
    // Replace inline code
    html = html.replace(/`([^`]+)`/gim, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>');

    // Replace blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 py-2 my-4">$1</blockquote>');

    // Replace paragraphs
    html = html.replace(/^\s*(\n)?(.+)/gim, function(m) {
      return /\<(\/)?(h1|h2|h3|h4|h5|h6|ul|ol|li|blockquote|pre|code)/.test(m) ? m : '<p>' + m + '</p>';
    });

    // Remove empty paragraphs
    html = html.replace(/<p><\/p>/gim, '');

    // Replace line breaks
    html = html.replace(/\n/gim, '<br>');

    return html;
  };

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content) }}
    />
  );
} 