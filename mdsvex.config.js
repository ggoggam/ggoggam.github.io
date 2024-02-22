import autolinkHeadings from 'rehype-autolink-headings';
import slugPlugin from 'rehype-slug';
import relativeImages from 'mdsvex-relative-images';
import remarkHeadings from '@vcarl/remark-headings';
import preview, { textFormatter } from 'remark-preview';
import readingTime from 'mdsvex-reading-time';
import remarkFootnotes from 'remark-footnotes';

export default {
	extensions: ['.md', '.svelte.md', '.svx'],
	smartypants: {
		dashes: 'oldschool'
	},
	remarkPlugins: [
		preview(textFormatter({ length: 250, maxBlocks: 2 })),
		headings,
		relativeImages,
		remarkFootnotes,
		readingTime,
	],
	rehypePlugins: [
		slugPlugin,
		[
			autolinkHeadings,
			{
				behavior: 'wrap'
			}
		]
	]
};


function headings() {
	return function transformer(tree, vfile) {
		// run remark-headings plugin
		remarkHeadings()(tree, vfile);

		// include the headings data in mdsvex frontmatter
		vfile.data.fm ??= {};
		vfile.data.fm.headings = vfile.data.headings.map((heading) => ({
			...heading,
			// slugify heading.value
			id: heading.value
				.toLowerCase()
				.replace(/\s/g, '-')
				.replace(/[^a-z0-9-]/g, '')
		}));
	};
}