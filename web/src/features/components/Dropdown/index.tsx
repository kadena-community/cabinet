import { Dispatch, SetStateAction, useState } from 'react';
import { ArrowDown } from 'react-feather';
import { Label } from '../Text';
import { OptionType } from './types';

export const Dropdown = ({
  options,
  title = 'Category',
  currentOption,
  setCurrentOption,
  maxWidth,
}: {
  options: OptionType[];
  title?: string;
  currentOption: OptionType;
  setCurrentOption: Dispatch<SetStateAction<OptionType>>;
  maxWidth?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div
      className={`relative w-full sm:max-w-xs md:max-w-sm lg:max-w-md bg-k-Cream-default text-gray-900 dark:bg-k-Blue-700 dark:text-k-Cream-default cursor-pointer rounded-xl transition-all border-2 border-gray-100 hover:border-gray-500 ${
        maxWidth ? `max-w-${maxWidth}` : ''
      }`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between w-full gap-3 p-2 cursor-pointer">
        <span className="flex-grow w-28 h-6 overflow-hidden text-ellipsis capitalize text-black dark:text-k-Cream-default">
          {currentOption.name ? currentOption.name : title}
        </span>
        <ArrowDown className="text-black w-6 h-6 dark:text-k-Cream-default" />
      </div>
      {open && (
        <div className="absolute z-10 top-12 left-0 right-0 bg-k-Cream-default text-black dark:bg-k-Blue-700 dark:text-k-Cream-default rounded-b-xl shadow-lg max-h-72 overflow-y-auto">
          {options.map((opt, index) => (
            <div
              key={index}
              className={`flex items-center p-2 text-sm capitalize cursor-pointer bg-k-Cream-default text-black dark:bg-k-Blue-700 dark:hover:bg-k-Green-default hover:bg-k-Green-default hover:text-black dark:text-k-Cream-default`}
              onClick={() => {
                setCurrentOption(opt);
                setOpen(false);
              }}
            >
              {opt.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
