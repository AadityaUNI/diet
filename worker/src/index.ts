export default {
  async fetch(request: Request, env: any) {
    return new Response("worker alive");
  },
};