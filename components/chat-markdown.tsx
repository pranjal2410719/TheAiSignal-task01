"use client";

import { memo, useMemo, useState } from "react";
import { marked, type Tokens } from "marked";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  language?: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const cleanLang = (language || "text").toLowerCase().trim();

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-line bg-[#161514] text-[#eae7e1] shadow-sm">
      <div className="flex items-center justify-between border-b border-[#2b2926] bg-[#1f1e1c] px-3.5 py-1.5 text-xs">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#9d9990]">
          {cleanLang}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-[#cfcbc4] hover:bg-[#2b2926] hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-3.5 text-xs leading-relaxed font-mono">
        <pre className="m-0 p-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function InlineTokens({ tokens }: { tokens?: Tokens.Generic[] }) {
  if (!tokens || tokens.length === 0) return null;

  return (
    <>
      {tokens.map((token, index) => {
        switch (token.type) {
          case "strong":
            return (
              <strong key={index} className="font-semibold text-ink">
                <InlineTokens tokens={token.tokens} />
              </strong>
            );
          case "em":
            return (
              <em key={index} className="italic">
                <InlineTokens tokens={token.tokens} />
              </em>
            );
          case "codespan":
            return (
              <code
                key={index}
                className="mx-0.5 rounded-md border border-line bg-sunken px-1.5 py-0.5 font-mono text-[11px] font-medium text-accent"
              >
                {token.text}
              </code>
            );
          case "link":
            return (
              <a
                key={index}
                href={token.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-accent underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                <InlineTokens tokens={token.tokens} />
              </a>
            );
          case "del":
            return (
              <del key={index} className="line-through text-muted">
                <InlineTokens tokens={token.tokens} />
              </del>
            );
          case "text":
          default:
            return token.text || token.raw || null;
        }
      })}
    </>
  );
}

function BlockToken({ token }: { token: Tokens.Generic }) {
  switch (token.type) {
    case "heading": {
      const depth = token.depth;
      const Tag = depth === 1 ? "h2" : depth === 2 ? "h3" : "h4";
      const classes =
        depth === 1
          ? "serif text-lg font-semibold text-ink mt-3 mb-1.5"
          : depth === 2
          ? "serif text-base font-medium text-ink mt-2.5 mb-1"
          : "font-semibold text-ink text-xs mt-2 mb-1";
      return (
        <Tag className={classes}>
          <InlineTokens tokens={token.tokens} />
        </Tag>
      );
    }

    case "paragraph":
      return (
        <p className="mb-2.5 last:mb-0 leading-relaxed text-ink/90">
          <InlineTokens tokens={token.tokens} />
        </p>
      );

    case "code":
      return <CodeBlock language={token.lang} code={token.text} />;

    case "blockquote":
      return (
        <blockquote className="my-2.5 border-l-2 border-accent pl-3.5 py-0.5 italic text-muted text-xs leading-relaxed">
          {token.tokens?.map((subToken: Tokens.Generic, i: number) => (
            <BlockToken key={i} token={subToken} />
          ))}
        </blockquote>
      );

    case "list": {
      const ListTag = token.ordered ? "ol" : "ul";
      return (
        <ListTag
          className={`my-2 space-y-1 pl-5 text-ink/90 leading-relaxed ${
            token.ordered ? "list-decimal" : "list-disc"
          }`}
          start={token.ordered && token.start ? Number(token.start) : undefined}
        >
          {token.items?.map((item: Tokens.ListItem, i: number) => (
            <li key={i} className="pl-1">
              {item.tokens?.map((itemToken: Tokens.Generic, j: number) => {
                if (itemToken.type === "text") {
                  return (
                    <span key={j}>
                      <InlineTokens tokens={itemToken.tokens || [{ type: "text", raw: itemToken.text, text: itemToken.text } as Tokens.Generic]} />
                    </span>
                  );
                }
                return <BlockToken key={j} token={itemToken} />;
              })}
            </li>
          ))}
        </ListTag>
      );
    }

    case "table":
      return (
        <div className="my-3 overflow-x-auto rounded-xl border border-line">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-line bg-sunken">
                {token.header?.map((cell: Tokens.TableCell, i: number) => (
                  <th key={i} className="p-2 font-semibold text-ink">
                    <InlineTokens tokens={cell.tokens} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {token.rows?.map((row: Tokens.TableCell[], rowIndex: number) => (
                <tr
                  key={rowIndex}
                  className="border-b border-line last:border-b-0 hover:bg-sunken/40 transition-colors"
                >
                  {row.map((cell: Tokens.TableCell, cellIndex: number) => (
                    <td key={cellIndex} className="p-2 text-ink/90">
                      <InlineTokens tokens={cell.tokens} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "hr":
      return <hr className="my-3 border-line" />;

    case "space":
      return null;

    default:
      if (token.text) {
        return <p className="mb-2 text-ink/90">{token.text}</p>;
      }
      return null;
  }
}

export const ChatMarkdown = memo(function ChatMarkdown({ content }: { content: string }) {
  const tokens = useMemo(() => {
    try {
      return marked.lexer(content);
    } catch {
      return null;
    }
  }, [content]);

  if (!tokens || tokens.length === 0) {
    return <p className="whitespace-pre-wrap break-words">{content}</p>;
  }

  return (
    <div className="chat-markdown text-xs sm:text-sm">
      {tokens.map((token, i) => (
        <BlockToken key={i} token={token} />
      ))}
    </div>
  );
});
