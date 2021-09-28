import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, IconButton } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";
import { useRouter } from "next/router";

interface EditDeleteButtonsProps {
  id: number;
  creatorId: number;
}

export const EditDeleteButtons: React.FC<EditDeleteButtonsProps> = ({
  id,
  creatorId,
}) => {
  const router = useRouter();
  const [, deletePost] = useDeletePostMutation();
  const [{ data: meData }] = useMeQuery();

  return meData?.me?.id === creatorId ? (
    <Box>
      <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
        <IconButton
          aria-label="Update post"
          icon={<EditIcon />}
          colorScheme="twitter"
          mr={4}
        />
      </NextLink>
      <IconButton
        aria-label="Delete post"
        icon={<DeleteIcon />}
        colorScheme="red"
        onClick={async () => {
          await deletePost({ id });
          router.push("/");
        }}
      />
    </Box>
  ) : null;
};
