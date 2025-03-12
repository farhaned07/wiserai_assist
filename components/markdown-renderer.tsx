"use client"

import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (!mounted) {
    return <div className={cn("markdown", className)}>{content}</div>
  }

  return (
    <div className={cn("markdown", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")
            const code = String(children).replace(/\n$/, "")

            return !inline && match ? (
              <div className="relative group">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyToClipboard(code)}
                    className="p-1 rounded-md bg-background/20 hover:bg-background/30 transition-colors"
                    aria-label="Copy code"
                  >
                    {copiedCode === code ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <SyntaxHighlighter
                  style={theme === "dark" ? vscDarkPlus : vs}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-md my-2 text-sm"
                  showLineNumbers
                  {...props}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={cn("bg-muted px-1.5 py-0.5 rounded text-sm", className)} {...props}>
                {children}
              </code>
            )
          },
          p({ children }) {
            return <p className="mb-4 last:mb-0">{children}</p>
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 mb-4">{children}</ul>
          },
          ol({ children }) {
            return <ol className="list-decimal pl-6 mb-4">{children}</ol>
          },
          li({ children }) {
            return <li className="mb-1">{children}</li>
          },
          blockquote({ children }) {
            return <Card className="border-l-4 border-primary p-4 my-4 bg-primary/5">{children}</Card>
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80 transition-colors"
              >
                {children}
              </a>
            )
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="w-full border-collapse">{children}</table>
              </div>
            )
          },
          thead({ children }) {
            return <thead className="bg-muted">{children}</thead>
          },
          tbody({ children }) {
            return <tbody>{children}</tbody>
          },
          tr({ children }) {
            return <tr className="border-b border-border">{children}</tr>
          },
          th({ children }) {
            return <th className="p-2 text-left font-semibold">{children}</th>
          },
          td({ children }) {
            return <td className="p-2 border-r last:border-r-0 border-border">{children}</td>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

