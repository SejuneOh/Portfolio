import Image from "next/image"
import Link from "next/link"

export default function UserAvator() {


  return (<>
    <div className="max-w-md flex flex-auto pt-6 py-18 items-center justify-center flex-col rounded-md shadow-lg bg-gray-100  dark:bg-slate-700">
      <div className="max-w-sm h-51 object-cover rouned-lg overflow-hidden my-4 border-solid border-2 border-white rounded-full">
        <Image
          src={"https://avatars.githubusercontent.com/u/103201530?s=400&u=bd447ab2dbe5bfd3ae1c96e2036df9f114865d10&v=4"}
          className="rounded-full"
          width={50}
          height={50}
          alt="avator"
          layout="responsive"
          objectFit="cover"
          quality={100}
        />

      </div>
      <div className="px-6 py-2 mb-2 bg-black">
        <h2 className="mx-3 text-white font-semibold text-lg">FrontEnd Egineer</h2>
      </div>
      <div className="flex flex-col justify-start items-center">
        <h2 className="text-lg font-semibold py-2">Sejune Oh</h2>
        <Link className="flex gap-2" href={"https://github.com/SejuneOh?tab=repositories"}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
          <span>Github Link</span>
        </Link>
      </div>
      <div className="px-2 py-2 container  mt-3 ">
        <h3 className="pl-2 font-semibold">Stack</h3>
        <div className="container flex gap-2 py-2 px-2 flex-wrap justify-center items-center ">
          <p className="badge-card bg-blue-400">React</p>
          <p className="badge-card bg-orange-300">HTML</p>
          <p className="badge-card bg-yellow-300">CSS</p>
          <p className="badge-card bg-red-300">Javascript</p>
          <p className="badge-card bg-green-400">TypeScript</p>
          <p className="badge-card bg-pink-400">Next.js</p>
          <p className="badge-card bg-gray-400">Node.js</p>
          <p className="badge-card bg-purple-400">Next.js</p>
        </div>
      </div>
      <div className="py-4">
        <Link href="/projects">
          <button className="bg-gray-400 rounded-md px-2 py-1 text-white">프로젝트 보기</button>
        </Link>
      </div>
    </div>
  </>)
}