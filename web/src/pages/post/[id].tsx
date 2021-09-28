import { Box, Heading } from "@chakra-ui/layout";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { EditDeleteButtons } from "../../components/EditDeleteButtons";
import { Layout } from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useIntId } from "../../utils/useIntId";

const Post: React.FC = ({}) => {
  const intId = useIntId();
  const [{ data, fetching, error }] = usePostQuery({
    variables: { id: intId },
    pause: intId === -1,
  });

  if (fetching) {
    return (
      <Layout>
        <Box>Loading...</Box>
      </Layout>
    );
  }
  if (error) {
    return (
      <Layout>
        <Box>{error.message}</Box>
      </Layout>
    );
  }
  if (!data?.post) {
    return (
      <Layout>
        <Box>404 - post not found</Box>
      </Layout>
    );
  }
  return (
    <Layout>
      <Heading mb={4}>{data.post.title}</Heading>
      <Box mb={4}>
        <i>Posted by {data.post.creator.username}</i>
        <p>{data.post.text}</p>
      </Box>
      <EditDeleteButtons id={data.post.id} creatorId={data.post.creator.id} />
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
