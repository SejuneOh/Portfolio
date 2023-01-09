

export default function Badge({ text, ...props }) {

  return (<>
    <h1 {...props} className="px-2 py-1 mr-2 mb-2 rounded-md  w-30 bg-blue-500 text-white">{text}</h1>
  </>)
}


