'use client'

export default function Button({title,myFunction}) {



  return (
   <button onClick={myFunction} className="text-white bg-slate-950 hover:bg-slate-900 p-3 text-xl" type="submit">
        {title}
   </button>
  )
}
