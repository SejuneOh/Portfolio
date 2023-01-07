import Link from "next/link";

export default function Description() {
  return <>
    <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
      <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
        여기는 타이틀
      </h1>
      <p className="mb-8 leading-relaxed">생생하며, 속잎나고, 무한한 그들의 창공에 일월과 위하여서. 피부가 얼음에 것은 구할 작고 있으랴? 소금이라 공자는 타오르고 끓는다. 품었기 얼음과 기쁘며, 따뜻한 인류의 보내는 무엇을 운다. 넣는 광야에서 풀이 얼마나 않는 모래뿐일 대고, 같지 위하여서 것이다. 전인 그들에게 반짝이는 방황하였으며, 위하여 그들을 고행을 역사를 사라지지 있으랴?</p>
      <div className="flex justify-center">
        <Link href="/projects">
          <button className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg">프로젝트 보러가기</button>
        </Link>
      </div>
    </div>
  </>
}