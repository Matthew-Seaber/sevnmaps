import fs from "fs"
import path from "path"

function changelogPage() {
    const changelogDirectory = path.join(process.cwd(), "data/changelog")
    const logs = fs.readdirSync(changelogDirectory)

    return (
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl sm:text-3xl font-semibold my-8">SevnMaps Changelog</h1>
      </div>
    );
}

export default changelogPage