import { getProjectById } from "@/actions/project"
import { redirect } from "next/navigation"
import Presentation from "./_components/Presentation"

type Props = {
    params: Promise<{
        presentationId: string
    }>
}

const Page = async ({params}: Props) => {
    const resolvedParams = await params
    const res = await getProjectById(resolvedParams.presentationId)

    if(res.status !== 200 || !res.data){
        redirect("/dashboard")
    }

  return (
    <Presentation project={res.data} />
  )
}

export default Page