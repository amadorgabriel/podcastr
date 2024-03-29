import format from "date-fns/format";
import { parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import Image from "next/image";
import Head from "next/head";
import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import { api } from "../../services/api";

import styles from "./episode.module.scss";
import { usePlayer } from "../../contexts/PlayerContext";

type Episode = {
  id: string;
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
  description: string;
};

type EpisodeProps = {
  episode: Episode;
};

export default function Episode({ episode }: EpisodeProps) {
  const router = useRouter();

  const { play } = usePlayer();

  return (
    <>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>

      <div className={styles.episode}>
        <div className={styles.thumbnailContainer}>
          <button type="button" onClick={router.back}>
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>

          <Image
            width={700}
            height={160}
            src={episode.thumbnail}
            alt={episode.title}
            objectFit="cover"
          />

          <button type="button" onClick={() => play(episode)}>
            <img src="/play.svg" alt="Tocar episódio" />
          </button>
        </div>

        <header>
          <h1>{episode.members}</h1>
          <span>{episode.members}</span>
          <span>{episode.publishedAt}</span>
          <span>{episode.durationAsString}</span>
        </header>

        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: episode.description }}
        />
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get("episodes", {
    params: {
      _limit: 2,
      _sort: "published_at",
      _order: "desc",
    },
  });

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id,
      },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ctx => {
  const { slug } = ctx.params;
  const { data } = await api.get(`/episodes/${slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), "d MMM yy", {
      locale: ptBR,
    }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  };

  return {
    props: { episode },
    revalidate: 60 * 60 * 24, // 24 horas
  };
};
