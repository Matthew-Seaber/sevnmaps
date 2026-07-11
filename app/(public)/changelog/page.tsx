import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";

function changelogPage() {
  const changelogDirectory = path.join(process.cwd(), "data/changelog");
  const files = fs.readdirSync(changelogDirectory);

  const logs = files.map((fileName) => {
    const filePath = path.join(changelogDirectory, fileName);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
      title: data.title,
      tag: data.tag,
      date: data.date,
      time: data.time,
      version: data.version,
      content: content,
    };
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-semibold mt-8 mb-2">
        SevnMaps Changelog
      </h1>
      <p className="mb-8">Check out the latest updates and improvements to the app!</p>

      {logs.map((log) => (
        <div
          key={log.version}
          className="mb-12 px-4 pb-12 text-muted-foreground border-b border-border"
        >
          <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-foreground">
            {log.title}
          </h3>
          <p className="text-sm sm:text-base">
            Published: {log.date} {log.time}
          </p>
          <p className="text-sm sm:text-base">v{log.version}</p>

          {log.tag && (
            <p className="my-2 py-1 px-4 w-fit bg-primary/20 rounded-md text-xs text-primary">
              {log.tag}
            </p>
          )}

          <div className="prose prose-slate dark:prose-invert mt-4">
            <ReactMarkdown>{log.content}</ReactMarkdown>
          </div>
        </div>
      ))}

      <p className="text-muted-foreground text-center text-sm mb-8">
        You&apos;ve reached the end!
      </p>
    </div>
  );
}

export default changelogPage;
