import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="my-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-text-secondary">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {item.href ? (
              <Link
                to={item.href}
                className="ml-2 hover:underline hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span className="ml-2 font-semibold text-text-primary">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
