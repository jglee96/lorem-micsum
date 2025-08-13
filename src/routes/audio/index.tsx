import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/audio/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/audio/"!</div>
}
