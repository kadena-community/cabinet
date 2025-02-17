import PollDescription from "./PollDescription";
import React from "react";

const CollapsiblePollDescription: React.FC<{ description: string }> = ({
  description,
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const maxLength = 300; // adjust as needed
  const isLong = description.length > maxLength;
  const displayedText =
    !expanded && isLong ? description.slice(0, maxLength) + "..." : description;

  return (
    <div>
      <PollDescription description={displayedText} />
      {isLong && (
        <span
          className="cursor-pointer text-blue-500 ml-2"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? "Show less" : "Show more"}
        </span>
      )}
    </div>
  );
};

export default CollapsiblePollDescription;
