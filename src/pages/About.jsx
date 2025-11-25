function About() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl mb-6">About Shelnet</h1>
      
      <div className="bg-theme-card border border-theme-border rounded-xl p-6 space-y-4">
        <p>
          Welcome to <strong>Shelnet</strong>, an independent learning hub built to help students prepare for CompTIA A+ and other IT certifications.
          The goal of this site is to provide <strong>free, high-quality, hands-on study tools</strong> — including interactive PBQs (Performance-Based Questions), practice exams, and tutorials — all accessible in a simple web format without logins or ads.
        </p>

        <h2 className="text-xl mt-6 mb-3">Site Overview</h2>
        <p className="text-theme-muted">
          Shelnet is designed for students who prefer a clear, distraction-free environment for exam prep.
          All resources are completely browser-based and self-contained, so they can be used online or offline after downloading.
        </p>

        <h3 className="text-lg mt-5 mb-2">Key Features</h3>
        <ul className="list-disc list-inside space-y-2 text-theme-muted ml-4">
          <li>Free, open-access CompTIA A+ practice environment</li>
          <li>Interactive PBQs covering real exam objectives</li>
          <li>Organized navigation by domain (Core 1 and Core 2)</li>
          <li>Responsive layout for desktop and mobile</li>
          <li>No external dependencies or sign-ups required</li>
        </ul>

        <h2 className="text-xl mt-6 mb-3">Future Plans</h2>
        <ul className="list-disc list-inside space-y-2 text-theme-muted ml-4">
          <li>Add additional CompTIA certifications (Network+, Security+)</li>
          <li>Include progress tracking and lightweight scoring</li>
          <li>Expand to cover troubleshooting scenarios for real-world labs</li>
        </ul>

        <h2 className="text-xl mt-6 mb-3">Feedback</h2>
        <p className="text-theme-muted">
          Shelnet is an ongoing project — if you discover a bug, have a PBQ idea, or want to contribute improvements, please open an issue in this repository or email the site maintainer.
        </p>

        <div className="mt-6 pt-4 border-t border-theme-border text-sm text-theme-muted">
          <p className="mb-2"><strong>License:</strong> This project is licensed under the MIT License. See the LICENSE file for details.</p>
          <p><strong>Branding Notice:</strong> All logos, images, and branding elements of Shelnet are copyright © 2025 lui-gi and may not be reused without permission. Only the source code is covered under the MIT License.</p>
        </div>
      </div>
    </div>
  )
}

export default About

