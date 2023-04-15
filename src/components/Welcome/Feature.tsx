import { IconType } from "@react-icons/all-files";
import React,{ ReactElement } from "react";

type Props = {
  icon: ReactElement<IconType>;
  name: string;
  description: string;
};
export default function Feature(props: Props) {
  const { icon, name, description } = props;
  return (
    <div className="relative">
      <dt>
        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md text-3xl bg-blue-700 text-white">
          <span>{icon} </span>
        </div>
        <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
          {name}
        </p>
      </dt>
      <dd className="mt-2 ml-16 text-base text-gray-700">{description}</dd>
    </div>
  );
}
