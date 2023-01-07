import Layout from "../components/layout"
import ProjectItem from "../components/projects/projectItem";
import { TOKEN, DATABASE_ID } from "../config/index"

export default function Projects({ projects }) {

  return <Layout >
    <div className="flex flex-col justify-center items-center min-h-screen px-5 py-23 mb-10">
      {
        projects.results ? (<>
          <h1 className="text-4xl font-bold sm:text-6xl mt-4">
            총 프로젝트:
            <span className="pl-4 text-blue-500">
              {`${projects.results.length}개`}
            </span>
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 m-6 py-10">
            {
              projects.results.map((item) => <ProjectItem key={item.id} data={item} />)
            }
          </div>
        </>) : (<>데이터가 없습니다.</>)
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

  return {
    props: { projects }, // will be passed to the page component as props
  }
}