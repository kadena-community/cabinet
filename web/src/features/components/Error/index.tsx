import ErrorIcon from '@/assets/images/error-icon.svg';

type ErrorProps = {
    message: string,
    iconClass?: string,
    textClass?: string
};

const Error: React.FC<ErrorProps> = ({ message, iconClass, textClass }) => {
    return (
        <div className="flex flex-col items-center text-center">
            <div className={`text-k-Orange-default h-12 w-12 ${iconClass}`}>
                <ErrorIcon />
            </div>
            <p className={`mt-4 ${textClass}`}>{message}</p>
        </div>
    );
};

export default Error;
