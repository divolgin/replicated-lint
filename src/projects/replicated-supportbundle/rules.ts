// THIS FILE IS AUTOGENERATED
// tslint:disable
export default [{"name":"spec-lifecycle-required","type":"warn","message":"No Lifecyle specified. Without a lifecycle, you will be unable to customize messaging for your end customer.","test":{"Falsey":{"path":"lifecycle"}},"examples":{"wrong":[{"description":"Spec has no `lifecycle`","yaml":"---\nspecs: []\nlifecycle:\n"},{"description":"Spec `lifecycle` is empty","yaml":"---\nspecs: []\nlifecycle: []\n"}],"right":[{"description":"Spec has a `lifecycle` specified","yaml":"---\nspecs: []\nlifecycle:\n  - message:\n      contents: generating bundle...\n  - generate: {}\n"}]}}]