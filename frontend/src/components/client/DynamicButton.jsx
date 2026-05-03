import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function SmartButton({ content, href, onClick, variant = "default", size = "default", ...props }) {
  if (href) {
    return (
      <Button asChild variant={variant} size={size} {...props}>
        <Link to={href}>{content}</Link>
      </Button>
    );
  }

  // Otherwise, we render a standard button that triggers a function
  return (
    <Button variant={variant} size={size} onClick={onClick} {...props}>
      {content}
    </Button>
  );
}

export default SmartButton;
