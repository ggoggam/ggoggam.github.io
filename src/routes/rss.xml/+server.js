import { siteConfig } from '$lib/config';
import { getPosts } from '$lib/posts.js';

export const prerender = true;

export async function GET({ setHeaders }) {
	setHeaders({
		'Cache-Control': `max-age=0, s-max-age=600`,
		'Content-Type': 'application/xml'
	});

    const posts = await getPosts();

	const xml = `<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
		<channel>
		  <title>${siteConfig.name}</title>
		  <link>${siteConfig.url}</link>
		  <description>${siteConfig.description}</description>
		  <atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml" />
		  ${posts
				.map(
					(post) =>
						`
				<item>
				  <guid>${siteConfig.url}/blog/${post.slug}</guid>
				  <title>${post.title}</title>
				  <description>${post.preview.text}</description>
				  <link>${siteConfig.url}/post/${post.slug}</link>
				  <pubDate>${new Date(post.date).toUTCString()}</pubDate>
			  </item>
			`
				)
				.join('')}
		</channel>
	  </rss>`;

	return new Response(xml);
}
