import { useEffect } from "react";
import Layout from "../components/layout"
import ProjectItem from "../components/projects/projectItem";
import { TOKEN, DATABASE_ID } from "../config/index"
import cover_1 from "../public/cover_1.jpeg";
import cover_2 from "../public/cover_2.jpeg";
import cover_3 from "../public/cover_3.jpeg";
import cover_4 from "../public/cover_4.jpeg";

export default function Projects({ ProjectArr }) {

  useEffect(() => {
  }, [])

  return <Layout >
    <div className="flex flex-col justify-center items-center min-h-screen px-5 py-23">
      {
        ProjectArr.length > 0 ? (
          <>
            <h1 className="text-4xl font-bold sm:text-6xl mt-4 ">
              총 프로젝트 : <span className="pl-4 text-blue-500">{`${ProjectArr.length}개`}</span>
            </h1>
            <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-8 m-6 py-10">
              {
                ProjectArr.map((item) => <ProjectItem key={item.id} data={item} />)
              }
            </div>
          </>
        ) : (
          <>
            <h1>데이터가 없습니다.</h1>
          </>
        )
      }
    </div>
  </Layout>
}

export async function getStaticProps(context) {

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Notion-Version': '2022-06-28',
      'content-type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: JSON.stringify({
      sorts: [{
        "property": "projectName",
        "direction": "ascending"
      }],
      page_size: 100
    })
  };

  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, options);
  const projects = await res.json()

  const ProjectArr = projects.results.map(data => {
    const project = {
      id: data.id,
      projectName: data.properties.projectName.title[0].plain_text ?? "",
      description: data.properties.description.rich_text[0].plain_text,
      cover: ((data.cover?.external.url || data.cover?.file.url) ?? "") || getRandomCover(),
      tags: data.properties.tag.multi_select ?? [],
      url: data.properties.github.url || "",
      startDate: data.properties.workPeriod.date.start || "",
      endDate: data.properties.workPeriod.date.end || "",
      status: data.properties.status.status.name === 'Done' ? true : false,
    }
    return project
  })


  return {
    props: { ProjectArr }, // will be passed to the page component as props
  }
}

function getRandomCover() {
  const images = [cover_1, cover_2, cover_3, cover_4];

  const randomIdx = Math.floor(Math.random() * 4)

  return images[randomIdx];
}