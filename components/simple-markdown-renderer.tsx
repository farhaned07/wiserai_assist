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
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-5 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>');

    // Replace bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/__(.*?)__/gim, '<strong>$1</strong>')
      .replace(/_(.*?)_/gim, '<em>$1</em>');

    // Replace links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>');

    // Replace lists
    html = html.replace(/^\s*\n\* (.*)/gim, '<ul class="list-disc pl-5 my-2">\n<li>$1</li>\n</ul>');
    html = html.replace(/^\s*\n\d\. (.*)/gim, '<ol class="list-decimal pl-5 my-2">\n<li>$1</li>\n</ol>');
    
    // Replace multiple <ul> or <ol> tags with just one
    html = html
      .replace(/<\/ul>\s*<ul>/gim, '')
      .replace(/<\/ol>\s*<ol>/gim, '');

    // Replace code blocks with language specification
    html = html.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/gim, (match, lang, code) => {
      const language = lang ? lang.trim() : '';
      const languageClass = language ? ` language-${language}` : '';
      const languageLabel = language ? `<div class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-t-md">${language}</div>` : '';
      
      return `${languageLabel}<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-md${languageClass} overflow-x-auto"><code>${code}</code></pre>`;
    });
    
    // Replace inline code
    html = html.replace(/`([^`]+)`/gim, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

    // Replace blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-600 dark:text-gray-300">$1</blockquote>');

    // Replace horizontal rules
    html = html.replace(/^---$/gim, '<hr class="my-4 border-t border-gray-300 dark:border-gray-600">');

    // Replace paragraphs
    html = html.replace(/^\s*(\n)?(.+)/gim, function(m) {
      return /\<(\/)?(h1|h2|h3|h4|h5|h6|ul|ol|li|blockquote|pre|code|hr)/.test(m) ? m : '<p class="my-2">' + m + '</p>';
    });

    // Remove empty paragraphs
    html = html.replace(/<p><\/p>/gim, '');

    // Replace line breaks
    html = html.replace(/\n/gim, '<br>');

    return html;
  };

  return (
    <div 
      className={`markdown-content ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content) }}
    />
  );
} 