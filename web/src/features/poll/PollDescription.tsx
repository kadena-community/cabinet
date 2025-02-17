import React from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface PollDescriptionProps {
  description: string;
}

const PollDescription: React.FC<PollDescriptionProps> = ({ description }) => {
  return (
    <div className="poll-description-markdown">
      <ReactMarkdown
        // Plugins for single-line breaks & GitHub-Flavored Markdown
        remarkPlugins={[remarkBreaks, remarkGfm]}
        // Override default rendering for certain elements
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold my-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold my-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold my-2" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside my-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside my-2" {...props} />
          ),
          li: ({ node, ...props }) => <li className="ml-4" {...props} />,
        }}
      >
        {description}
      </ReactMarkdown>
    </div>
  );
};

export default PollDescription;
