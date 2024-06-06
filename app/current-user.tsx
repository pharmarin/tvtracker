"use client";

import { setUserCookieAction } from "@/app/actions";
import type { User } from "@/app/utils";
import { getCurrentUser, Users } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";

const switchUser = (currentUser: Users) => {
  switch (currentUser) {
    case Users.Marion:
      return Users.Marin;
    case Users.Marin:
    default:
      return Users.Marion;
  }
};

const CurrentUser = ({ currentUserCookie }: { currentUserCookie: User }) => {
  const [currentUser, setCurrentUser] = useState(currentUserCookie);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      className="rounded-full"
      onClick={async () => {
        const nextUser = switchUser(currentUser.user);
        setIsLoading(true);
        await setUserCookieAction({ user: nextUser });
        setCurrentUser(getCurrentUser(nextUser));
        setIsLoading(false);
      }}
      variant="ghost"
    >
      {isLoading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        currentUser.initials
      )}
    </Button>
  );
};

export default CurrentUser;
