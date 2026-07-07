import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";

function TermsPage() {
  const termsDirectory = path.join(process.cwd(), "data/terms");
  const files = fs.readdirSync(termsDirectory);
  const filePath = path.join(termsDirectory, files[0]);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { content } = matter(fileContent);

  return (
    <div className="max-w-6xl p-4 mx-auto">
      <h1 className="font-bold text-2xl sm:text-3xl mb-1">
        Terms and Conditions
      </h1>
      <i className="text-sm">Last updated: 11:30 BST, 7th July 2026</i>

      <div className="my-6 prose prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

export default TermsPage;
