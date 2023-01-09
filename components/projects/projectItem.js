import Image from "next/image";


export default function ProjectItem({ data }) {

  const calcDate = (s, e) => {
    const startDateStringArray = s.split('-');
    const endDateStringArray = e.split('-');

    var startDate = new Date(startDateStringArray[0], startDateStringArray[1], startDateStringArray[2]);
    var endDate = new Date(endDateStringArray[0], endDateStringArray[1], endDateStringArray[2]);


    const diffInMs = Math.abs(endDate - startDate);
    const result = diffInMs / (1000 * 60 * 60 * 24);

    return result;
  }

  return (
    <div className="project-card ">
      {data.cover && <Image
        className="rounded-t"
        src={data.cover}
        alt="cover Image"
        width="100"
        height="100"
        layout="responsive"
        objectFit="cover"
        quality={100}
      />
      }

      <div className="p-4 flex flex-col">
        <h1 className="text-2xl font-bold">{data.title}</h1>
        <h3 className="mt-4 text-xl">
          {data.description}
        </h3>
        {data.status ? (<>
          <p className="my-1">
            작업시간 : {data.startDate} ~ {data.endDate} ({calcDate(data.startDate, data.endDate)}일)
          </p>
        </>) : (<></>)}

        <a href={data.url}>github 바로가기</a>
        <div className="flex items-start mt-2">
          {data.tags.map((tag) => (<h1 className="px-2 py-1 mr-2 rounded-md bg-sky-200 dark:bg-sky-700 w-30" key={tag.id}>{tag.name}</h1>))}
        </div>
      </div>
    </div>)
}