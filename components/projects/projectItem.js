import Image from "next/image";


export default function ProjectItem({ data }) {

  const title = data.properties.projectName.title[0].plain_text
  const github = data.properties.github.url
  const description = data.properties.description.rich_text[0].plain_text;
  const img = data.cover.file?.url ?? data.cover.external.url
  const tags = data.properties.tag.multi_select
  const start = data.properties.workPeriod.date.start
  const end = data.properties.workPeriod.date.end

  const calcDate = (s, e) => {
    const startDateStringArray = start.split('-');
    const endDateStringArray = end.split('-');

    var startDate = new Date(startDateStringArray[0], startDateStringArray[1], startDateStringArray[2]);
    var endDate = new Date(endDateStringArray[0], endDateStringArray[1], endDateStringArray[2]);

    console.log(`startDate: ${startDate}`)
    console.log(`endDate: ${endDate}`)

    const diffInMs = Math.abs(endDate - startDate);
    const result = diffInMs / (1000 * 60 * 60 * 24);

    console.log(`기간 : ${result}`)
    return result;
  }

  return (
    <div className="project-card ">
      <Image
        className="rounded-t"
        src={img}
        alt="cover Image"
        width="100"
        height="100"
        layout="responsive"
        objectFit="cover"
        quality={100}
      />
      <div className="p-4 flex flex-col">
        <h1 className="text-2xl font-bold">{title}</h1>
        <h3 className="mt-4 text-xl">
          {description}
        </h3>
        <p className="my-1">
          작업시간 : {start} ~ {end} ({calcDate(start, end)}일)
        </p>
        <a href={github}>github 바로가기</a>
        <div className="flex items-start mt-2">
          {tags.map((tag) => (<h1 className="px-2 py-1 mr-2 rounded-md bg-sky-200 dark:bg-sky-700 w-30" key={tag.id}>{tag.name}</h1>))}
        </div>
      </div>
    </div>)
}