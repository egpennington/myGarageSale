export default async () => {
  return new Response(
    JSON.stringify({
      message: 'Hello Nam Do-san, from myGarageSale backend!',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}