import { n as SAMPLE_CSV } from "./sample-D-33kfTV.mjs";
import { y as useBook } from "./store-Bj7SGyFp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/open-job-DCawJpH5.js
function loadJobBook(job) {
	const text = job.csvText ?? (job.csvName === "2501384_SR67_Topo_PNEZD.csv" || job.des === "2501384" ? SAMPLE_CSV : void 0);
	const name = job.csvName ?? (text ? "2501384_SR67_Topo_PNEZD.csv" : void 0);
	if (text && name) useBook.getState().loadBook(text, name, {
		remaps: job.remaps,
		userLines: job.userLines,
		survey: job.survey,
		order: job.coordOrder
	});
	else if (!text) useBook.getState().clear();
}
//#endregion
export { loadJobBook as t };
