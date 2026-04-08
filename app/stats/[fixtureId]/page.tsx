


import FixtureStatsPage from "../statsPage";

interface Props {
  params: { fixtureId: string };
}

export default function Page({ params }: Props) {
  const { fixtureId } = params;

  return <FixtureStatsPage />;
}