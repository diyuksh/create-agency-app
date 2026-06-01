import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Agency Template";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

export default async function Image() {
	return new ImageResponse(
		<div
			style={{
				fontSize: 64,
				background: "white",
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "column",
				color: "black",
				fontWeight: 700,
				letterSpacing: "-0.02em",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				Agency Template
			</div>
		</div>,
		{
			...size,
		},
	);
}
