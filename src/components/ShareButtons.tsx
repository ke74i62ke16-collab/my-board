type Props = {
  url: string;
  title: string;
};

export default function ShareButtons({ url, title }: Props) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const xHref = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const lineHref = `https://line.me/R/msg/text/?${encodeURIComponent(`${url} ${title}`)}`;

  return (
    <div className="flex items-center gap-2">
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Xでシェア"
        className="transition-opacity hover:opacity-75"
      >
        <img
          src="https://abs.twimg.com/favicons/twitter.3.ico"
          alt="Xでシェア"
          width={22}
          height={22}
          style={{ borderRadius: "4px" }}
        />
      </a>
      <a
        href={lineHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LINEでシェア"
        className="transition-opacity hover:opacity-75"
      >
        <img
          src="/line-icon.svg"
          alt="LINEでシェア"
          width={24}
          height={24}
          style={{ borderRadius: "6px" }}
        />
      </a>
    </div>
  );
}
