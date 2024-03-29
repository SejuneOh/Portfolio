import Image from "next/image";
import { useEffect } from "react";
import Badge from "../ badge";


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
        className="rounded-t max-h-full"
        src={data.cover}
        alt="cover Image"
        width="100"
        height="100"
        layout="responsive"
        quality={100}
      />
      }

      <div className="p-4 flex flex-col">
        <h1 className="text-2xl font-bold">{data.projectName}</h1>
        <h3 className="mt-4 text-xl">
          {data.description}
        </h3>
        {data.status ? (<>
          <p className="my-1">
            작업시간 : {data.startDate} ~ {data.endDate} ({calcDate(data.startDate, data.endDate)}일)
          </p>
        </>) : (<>
          <p className="my-1">
            작업시간: {data.startDate} ~ 진행 중
          </p>
        </>)}

        {data.url &&
          <a href={data.url}>github 바로가기</a>
        }
        <div className="flex flex-wrap items-start mt-2 mb-2">
          {data.tags.map((tag) => (<Badge key={tag.id} text={tag.name} />))}
        </div>
      </div>
    </div>)
}