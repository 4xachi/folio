const fs = require("fs").promises;
const projectData = require("../src/public/project-data.json");

const generateProjectHtml = (project, index, setIndex) => {
  const isEven = index % 2 === 0;
  const lineDirection = isEven ? "left" : "right";
  const scrollSpeed = isEven ? 8 : -8;
  const scrollDirection = isEven ? "right" : "left";
  const featured = setIndex === 0 && index === 0;

  const labelInner = featured
    ? `<div class="label__inner label-1">
             <p>
               FEATURED <br />
               PROJECTS (${projectData.length})
             </p>
             <p>${project.role}</p>
           </div>`
    : `<div class="label__inner">
             <p>${project.role}</p>
           </div>`;

  return `
        <span class="home__projects__line ${lineDirection}"><span></span></span>
        <div class="home__projects__project ${scrollDirection}">
          <div class="home__projects__project__label">
            ${labelInner}
          </div>

          <a
            href="${project.link}"
            target="_blank"
            rel="noopener noreferrer"
            class="home__projects__project__link"
          >
            <h1
              class="home__projects__project__title"
              data-scroll=""
              data-scroll-direction="horizontal"
              data-scroll-speed="${scrollSpeed}"
            >
              <span class="inline-ovh">
                <div class="title__main ${scrollDirection}">
                  <span
                    class="slide-up"
                    data-content="${project.title}"
                    aria-hidden="true"
                  ></span>
                  ${project.title}
                </div>
              </span>
            </h1>
          </a>

          <div class="project__link">
            <a
              href="${project.link}"
              target="_blank"
              rel="noopener noreferrer"
              class="c-button"
            >
              <span class="c-link">
                <span class="c-link__inner">
                  <span>
                    Visit Site
                    <span class="share-icon">
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.337 7.845l-7.173 7.173-1.178-1.179 7.172-7.172H5.837V5h9.166v9.167h-1.666V7.845z"
                          fill="#777"
                        ></path>
                      </svg>
                    </span>
                  </span>
                </span>
              </span>
            </a>
          </div>
        </div>`;
};

const buildHtml = async () => {
  let html = await fs.readFile("./src/index.html", "utf8");

  const set1 = projectData.slice(0, 2);
  const set2 = projectData.slice(2);

  // Generate html for set 1
  let set1Html = `<section class="home__projects" data-projects-section-1="">`;
  set1.forEach((project, index) => {
    set1Html += generateProjectHtml(project, index, 0);
  });
  set1Html += `\n        <span class="home__projects__line ${
    set1.length % 2 === 0 ? "left" : "right"
  }"><span></span></span>\n      </section>`;

  // Generate html for set 2
  let set2Html = `<section class="home__projects" data-projects-section-2="">`;
  set2.forEach((project, index) => {
    set2Html += generateProjectHtml(project, index, 1);
  });
  set2Html += `\n        <span class="home__projects__line ${
    set2.length % 2 === 0 ? "left" : "right"
  }"><span></span></span>\n      </section>`;

  // Replace data-projects-section-1 block
  const section1Regex = /<section class="home__projects" data-projects-section-1="">([\s\S]*?)<\/section>/;
  html = html.replace(section1Regex, set1Html);

  // Replace data-projects-section-2 block
  const section2Regex = /<section class="home__projects" data-projects-section-2="">([\s\S]*?)<\/section>/;
  html = html.replace(section2Regex, set2Html);

  await fs.writeFile("./src/index.html", html, "utf8");
  console.log("Successfully rebuilt projects in index.html without Cheerio!");
};

buildHtml().catch(console.error);
